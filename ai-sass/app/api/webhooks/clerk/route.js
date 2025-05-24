// app/api/webhooks/clerk/route.js
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req) {
    const payload = await req.json();
    const headerList = headers();

    const svixId = headerList.get('svix-id');
    const svixTimestamp = headerList.get('svix-timestamp');
    const svixSignature = headerList.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new NextResponse('Error occurred -- no svix headers', {
            status: 400,
        });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(JSON.stringify(payload), {
            'svix-id': svixId,
            'svix-timestamp': svixTimestamp,
            'svix-signature': svixSignature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new NextResponse('Error verifying webhook', {
            status: 400,
        });
    }

    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    try {
        await dbConnect();

        switch (eventType) {
            case 'user.created':
                await User.create({
                    clerkUserId: id,
                    email: attributes.email_addresses[0].email_address,
                    firstName: attributes.first_name,
                    lastName: attributes.last_name,
                    username: attributes.username,
                    profileImage: attributes.profile_image_url,
                });
                break;

            case 'user.updated':
                await User.findOneAndUpdate({ clerkUserId: id }, {
                    email: attributes.email_addresses[0].email_address,
                    firstName: attributes.first_name,
                    lastName: attributes.last_name,
                    username: attributes.username,
                    profileImage: attributes.profile_image_url,
                    lastSignedIn: new Date(),
                });
                break;

            case 'user.deleted':
                await User.findOneAndDelete({ clerkUserId: id });
                break;
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error('Database operation failed:', err);
        return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    }
}