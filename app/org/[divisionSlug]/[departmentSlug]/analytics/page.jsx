import { getDepartment, getDivision, getAIBinding } from '../../../../../lib/registry/orgRegistry.js';
import { getAISystem } from '../../../../../lib/registry/aiSystems.js';
import DepartmentAnalytics from '../../../../../components/org/DepartmentAnalytics.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { departmentSlug } = params;
  const dept = getDepartment(departmentSlug);
  return {
    title: dept ? `${dept.name} - Analytics` : 'Department Analytics',
    description: 'Department analytics and performance metrics'
  };
}

export default function AnalyticsPage({ params }) {
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
      secondary: getAISystem(binding?.secondaryAI)
    }
  };
  
  return <DepartmentAnalytics department={departmentData} />;
}
