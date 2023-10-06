import { useSupabaseClient } from "@supabase/auth-helpers-react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserProfileAvatar from "../../../components/ui/UserProfileAvatar";


  export default function UsersPage() {
    const [userProfiles, setUserProfiles] = useState<any>([]);
    const supabase = useSupabaseClient();
    const router = useRouter();

    // Update when the route changes
    useEffect(() => {
        const handleAsync = async () => {
            let { data } = await supabase.from('users').select(`*`);
            setUserProfiles(data);
        }
        handleAsync();
    }, []);

    const handleReturn = () => {
        router.push('/admin/dashboard');
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8 mt-8 overflow-scroll max-h-full">

        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">Manage Users</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all the users in the app, plus the user admin functions.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none px-4">
            <button
                onClick={handleReturn}
                type="button"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 mx-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ww-secondary focus:ring-offset-2"
            >
                Dashboard
            </button>
          </div>
        </div>
        <div className="-mx-4 mt-8   shadow ring-1 ring-black ring-opacity-5 sm:-mx-6 md:mx-0 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 mb-10">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Id
                </th>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Username
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Avatar
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                Joined
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Admin
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Banned to
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {userProfiles.map((person) => (
                <tr key={person.id ? person.id: 'p1'}>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                    {person.id}
    
                  </td>
                  <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                    {person.username}
    
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    <UserProfileAvatar userProfile={person} />
                 </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(person.inserted_at),{addSuffix: true})}
                 </td>
                 <td className="px-3 py-4 text-sm text-gray-500">
                    {person.admin && <p>TRUE</p>} 
                    {!person.admin && <p>FALSE</p>}
                 </td>
                 <td className="px-3 py-4 text-sm text-gray-500">
                    {person.banned_to}
                 </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <a href={`/admin/users/${person.id}`} className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="py-10 spacer">
        </div>
      </div>
    )
  }
  