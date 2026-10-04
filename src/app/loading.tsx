import { Loader } from "@/components/motion/loader";

export default function Loading() {
    return (
        <div className="grid min-h-screen place-items-center bg-background">
            <div role="status">
                <Loader variant="metaballs"></Loader>
            </div>
        </div>
    );
}