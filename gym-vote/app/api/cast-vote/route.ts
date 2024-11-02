import { exec } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { proposal } = await req.json();

    return new Promise((resolve, reject) => {
        exec(`npx hardhat cast-vote ${proposal}`, { cwd: '../../gymclass' }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error casting vote:', stderr);
                reject(new Response(`Vote error: ${stderr}`, { status: 500 }));
            } else {
                console.log('Vote cast:', stdout);
                resolve(new NextResponse(stdout));
            }
        });
    });
}
