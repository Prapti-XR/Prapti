import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 192,
    height: 192,
};

export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: '#8B4513',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EFEBE9',
                    fontFamily: 'serif',
                    fontWeight: 'bold',
                }}
            >
                P
            </div>
        ),
        {
            ...size,
        }
    );
}
