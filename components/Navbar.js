export default function Navbar() {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-white font-bold text-sm tracking-tighter">HK</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">HappyKuliner UserHub</span>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
