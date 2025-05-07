function Footer() {
  return (
    <footer className="bg-base-200 text-base-content p-4 fixed bottom-0 left-0 right-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-base-content">
          🄯 {new Date().getFullYear()} ModuLearn. See our license <a href="/license" className="text-primary">here</a>.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 