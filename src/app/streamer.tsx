export function Streamer({ uploadStatus, streamUrl }: { uploadStatus: string; streamUrl: string }) {    
    return (
        <div className="flex min-h-screen flex-col items-center justify-between p-24">
            <p className="mt-3 text-sm text-gray-200">{uploadStatus}</p>
            {streamUrl ? (
                <video controls src={streamUrl} className="mt-4 w-full rounded-md bg-black" />
            ) : null}
        </div>
    );
}
