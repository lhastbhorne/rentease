import { Link } from "react-router-dom";
import { FaUser, FaBuilding, FaHome } from "react-icons/fa";

import AuthLayout from "../../components/auth/AuthLayout";

function Register() {
  const accountTypes = [
    {
      title: "Tenant",
      description: "Find verified rental properties and manage your rentals.",
      icon: <FaUser className="text-3xl text-blue-600" />,
      link: "/register/tenant",
      button: "Continue as Tenant",
    },
    {
      title: "Landlord",
      description: "List your properties and manage tenants securely.",
      icon: <FaHome className="text-3xl text-green-600" />,
      link: "/register/landlord",
      button: "Continue as Landlord",
    },
    {
      title: "Agent",
      description: "Manage clients and property listings professionally.",
      icon: <FaBuilding className="text-3xl text-purple-600" />,
      link: "/register/agent",
      button: "Continue as Agent",
    },
  ];

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Choose the type of account you want to create."
    >
      <div className="space-y-5">
        {accountTypes.map((account) => (
          <div
            key={account.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div>{account.icon}</div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  {account.title}
                </h3>

                <p className="mt-2 text-slate-600">{account.description}</p>

                <Link
                  to={account.link}
                  className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  {account.button}
                </Link>
              </div>
            </div>
          </div>
        ))}

        <p className="pt-4 text-center text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
