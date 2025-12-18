export function makeEmployeeTxt(employee) {
  const {
    name = '',
    assigned_system = '',
    job_title = '',
    department = '',
    subdepartment = '',
    persona_text = '',
    skills = [],
    interests = [],
    avatar_prompt = '',
    avatar_image_url = '',
    avatar_image_b64 = '',
    signature_text = '',
    signature_svg = ''
  } = employee || {};

  const formatList = list => {
    if (!Array.isArray(list) || list.length === 0) {
      return '- ';
    }

    return list.map(item => `- ${item}`).join('\n');
  };

  return `NAME: ${name}
SYSTEM: ${assigned_system}
JOB_TITLE: ${job_title}
DEPARTMENT: ${department}
SUBDEPARTMENT: ${subdepartment}

PERSONA:
${persona_text}

SKILLS:
${formatList(skills)}

INTERESTS:
${formatList(interests)}

AVATAR:
- prompt: ${avatar_prompt}
- image_url: ${avatar_image_url}
- image_b64: ${avatar_image_b64}

SIGNATURE:
- text: ${signature_text}
- svg:
${signature_svg}
`;
}
