import { getSubDepartment, getDepartment, getDivision, getAIBinding } from '../../../../../../lib/registry/orgRegistry.js';
import { getAISystem } from '../../../../../../lib/registry/aiSystems.js';
import AIActivityLog from '../../../../../../components/org/AIActivityLog.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { subDeptSlug } = params;
  const subDept = getSubDepartment(subDeptSlug);
  return {
    title: subDept ? `${subDept.name} - AI Activity Log` : 'AI Activity Log',
    description: 'AI activity audit log for sub-department'
  };
}

export default function SubDeptAIActivityLogPage({ params }) {
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
  
  const departmentData = {
    ...subDepartment,
    isSubDepartment: true,
    parentDepartment,
    division,
    binding,
    aiInfo: {
      primary: getAISystem(binding?.primaryAI),
      secondary: getAISystem(binding?.secondaryAI),
      execution: getAISystem(binding?.executionAI)
    }
  };
  
  return <AIActivityLog department={departmentData} />;
}
