export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Login</h2>
        <p className="text-sm text-gray-500 mt-1">Employee Management System</p>
        {/* Team placeholder */}
        <div className="mt-6 border-2 border-dashed border-gray-200 p-4 text-center text-gray-400 rounded">
          [Form Implementation: Email, Password, Forgot Pass Link]
        </div>
      </div>
    </div>
  );
}