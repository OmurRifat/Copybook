import React from 'react'

export default function CommonLoader({
    size = '16',
    text,
    color = 'white'
}: {
    size?: string,
    text?: string,
    color?: string
}) {
    return (
        <div className='d-flex align-items-center gap-2'>
            {text && <span className='text-sm'>{text}</span>}
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    border: '2px solid rgba(252, 252, 252, 0.3)',
                    borderTop: `2px solid ${color}`,
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}
            ></div>
        </div>
    )
}
