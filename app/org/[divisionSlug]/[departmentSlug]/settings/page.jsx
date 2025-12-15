import { getDepartment, getDivision, getAIBinding } from '../../../../../lib/registry/orgRegistry.js';
import { getAISystem } from '../../../../../lib/registry/aiSystems.js';
import DepartmentSettings from '../../../../../components/org/DepartmentSettings.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { departmentSlug } = params;
  const dept = getDepartment(departmentSlug);
  return {
    title: dept ? `${dept.name} - Settings` : 'Department Settings',
    description: 'Department configuration and settings'
  };
}

export default function SettingsPage({ params }) {
  const { divisionSlug, departmentSlug } = params;
  
  const division = getDivision(divisionSlug);
  const department = getDepartment(departmentSlug);
  const binding = getAIBinding(departmentSlug);
  
  if (!department) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Department Not Found</h1>
        <p className="text-gray-400 mt-2">The department "{departmentSlug}" does not exist.</p>
      </div>
    );
  }
  
  const departmentData = {
    ...department,
    division,
    binding,
    aiInfo: {
      primary: getAISystem(binding?.primaryAI),
      secondary: getAISystem(binding?.secondaryAI),
      execution: getAISystem(binding?.executionAI),
      escalation: getAISystem(binding?.escalationTarget)
    }
  };
  
  return <DepartmentSettings department={departmentData} />;
}
