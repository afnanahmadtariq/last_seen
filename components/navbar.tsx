import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { User, LogOut } from "lucide-react";
import { FC } from "react";

type NavbarProps = {
  showProfilesButton?: boolean;
};

const Navbar: FC<NavbarProps> = ({ showProfilesButton = false }) => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 glass dark:glass-dark border-b border-gray-300/50 dark:border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center animate-fade-in">
            <div className="relative">
              {/* <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" /> */}
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                LastSeenPing
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {showProfilesButton ? 'Website profiles' : 'Monitoring dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 animate-fade-in">
            <ThemeToggle />
            {showProfilesButton ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profiles")}
                className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
              >
                👤 Profiles
              </Button>
            ):
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              🏠 Dashboard
            </Button>
            }
            {session && (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50">
                <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
