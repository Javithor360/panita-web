import { getSession } from "@/lib/auth";
import { getFormFull } from "@/app/actions/forms";
import { redirect } from "next/navigation";
import { FormBuilder } from "./FormBuilder";

export default async function EditFormPage(props: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');
  
  const params = await props.params;
  
  const form = await getFormFull(params.id);
  if (!form) redirect('/admin/forms');

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 50% -20%, rgba(139, 92, 246, 0.25), transparent 70%),
            radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '100% 100%, 28px 28px',
          backgroundPosition: 'center center'
        }}
      />
      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-8">
        <FormBuilder initialForm={form} />
      </div>
    </div>
  );
}
