export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal Positioning Trick */}
                <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

                {/* Modal Content */}
                <div
                    className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full border border-gray-100 z-10"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                >
                    <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight" id="modal-headline">
                            {title}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all p-2 rounded-xl"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="px-8 py-8 text-gray-700 bg-white">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
