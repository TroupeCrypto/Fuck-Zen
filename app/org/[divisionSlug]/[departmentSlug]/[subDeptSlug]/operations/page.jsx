import { getSubDepartment, getDepartment, getDivision, getAIBinding } from '../../../../../../lib/registry/orgRegistry.js';
import { getAISystem } from '../../../../../../lib/registry/aiSystems.js';
import DepartmentOperations from '../../../../../../components/org/DepartmentOperations.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { subDeptSlug } = params;
  const subDept = getSubDepartment(subDeptSlug);
  return {
    title: subDept ? `${subDept.name} - Operations` : 'Sub-Department Operations',
    description: 'Sub-department operations and workflow management'
  };
}

export default function SubDeptOperationsPage({ params }) {
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
      execution: getAISystem(binding?.executionAI)
    }
  };
  
  return <DepartmentOperations department={departmentData} />;
}
