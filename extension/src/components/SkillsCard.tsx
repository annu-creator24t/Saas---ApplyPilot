interface Props {
  skills: string[];
}

export default function SkillsCard({ skills }: Props) {
  return (
    <div className="mt-5 rounded-2xl bg-white shadow-lg p-5">
      <h3 className="font-semibold mb-3">
        Missing Skills
      </h3>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-red-100 text-red-600 px-3 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}