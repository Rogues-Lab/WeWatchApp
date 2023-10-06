import { useSupabaseClient } from "@supabase/auth-helpers-react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import UserProfileAvatar from "../../../components/ui/UserProfileAvatar";
import { completeNotification } from "../../../store/notifications";
import MessageRow from "./MessageRow";


  export default function UsersPage() {
    const [reports, setReports] = useState<any>([]);
    const supabase = useSupabaseClient();
    const router = useRouter();

    const loadReports = async () => {
      let { data } = await supabase.from('reports').select(`*`).eq('completed',false).order('created_at');
      setReports(data);
    }

    // Update when the route changes
    useEffect(() => {
        const handleAsync = async () => {
          await loadReports();
        }
        handleAsync();
    }, []);

    const completeReport = async ( report) => {
      let result = await supabase.from('reports').update({completed: true} ).eq('id', report.id).select();
      loadReports();
    }

    const handleReturn = () => {
        router.push('/admin/dashboard');
    }

    const viewReportObject = (report) => {
      debugger;
      if (report){
        if (report.mode == "person"){
          window.open(`/admin/users/${report.object_id}`, "_blank");
        } else {
          window.open(`/tabs/incidents/${report.object_id}`, "_blank");
        }
      }
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8 mt-8 overflow-scroll max-h-full">

        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">Manage Reports</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              A list of all the users reports in the app, plus the action functions.
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
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Ref
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                >
                  Reason
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
                >
                Mode
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Raised By
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Raised At
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Related UGC Content
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white mb-10">
              { reports.map((report) => {
                if (report.mode == "message")
                  return <MessageRow report={report} completeReport={completeReport} supabase={supabase} />
                else {
                  return (
                    <>
                      <tr key={report.id}>
                        <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-6">
                          {report.id}
        
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {report.reason}
                      </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {report.mode}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                          <a href={`/admin/users/${report.user_id}`} target="blank" className="text-indigo-600 hover:text-indigo-900 px-2" >{report.user_id} </a>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                          {report.created_at}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                          {report.object_type} #{report.object_id}
                      </td>
                        <td className="py-4 pl-3 px-1pr-4 text-right text-sm font-medium sm:pr-6">
                          <a onClick={()=>{completeReport(report)}}className="text-indigo-600 hover:text-indigo-900 px-2">
                            Complete
                          </a>
                          <a onClick={()=>{viewReportObject(report)}} className="text-indigo-600 hover:text-indigo-900  px-2">
                            View
                          </a>
                        </td>
                      </tr>
                    </>
                  )
                  }
                }
              )}
            </tbody>
          </table>
        </div>
        <div className="py-10 spacer">
        </div>
      </div>
    )
  }
  