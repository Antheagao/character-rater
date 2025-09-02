export default function Footer() {
    return (
        <footer className="border-t border-black/5 bg-white dark:bg-neutral-900 dark:border-white/10">
            <div className="mx-auto max-w-screen-xl px-4 py-6 text-center">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    @ {new Date().getFullYear()} Anthony Mendez
                </p>
            </div>
        </footer>
    );
}
