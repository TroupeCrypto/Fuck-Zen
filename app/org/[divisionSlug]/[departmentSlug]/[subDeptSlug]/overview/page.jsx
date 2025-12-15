import { getSubDepartment, getDepartment, getDivision, getAIBinding } from '../../../../../../lib/registry/orgRegistry.js';
import { getAISystem } from '../../../../../../lib/registry/aiSystems.js';
import DepartmentOverview from '../../../../../../components/org/DepartmentOverview.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { subDeptSlug } = params;
  const subDept = getSubDepartment(subDeptSlug);
  return {
    title: subDept ? `${subDept.name} - Overview` : 'Sub-Department Overview',
    description: subDept?.description || 'Sub-department overview page'
  };
}

export default function SubDeptOverviewPage({ params }) {
  const { divisionSlug, departmentSlug, subDeptSlug } = params;
  
  const division = getDivision(divisionSlug);
  const parentDepartment = getDepartment(departmentSlug);
  const subDepartment = getSubDepartment(subDeptSlug);
  const binding = getAIBinding(subDeptSlug);
  
  if (!subDepartment) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Sub-Department Not Found</h1>
        <p className="text-gray-400 mt-2">The sub-department "{subDeptSlug}" does not exist.</p>
      </div>
    );
  }
  
  const primaryAI = getAISystem(binding?.primaryAI);
  const secondaryAI = getAISystem(binding?.secondaryAI);
  const executionAI = getAISystem(binding?.executionAI);
  const escalationAI = getAISystem(binding?.escalationTarget);
  
  const departmentData = {
    ...subDepartment,
    isSubDepartment: true,
    parentDepartment,
    division,
    binding,
    aiInfo: {
      primary: primaryAI,
      secondary: secondaryAI,
      execution: executionAI,
      escalation: escalationAI
    }
  };
  
  return <DepartmentOverview department={departmentData} />;
}
