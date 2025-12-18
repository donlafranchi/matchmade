import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth";
import {
  RelationshipContextType,
  TonePreference,
  prisma,
} from "@/lib/prisma";

const contextOptions: { value: RelationshipContextType; label: string }[] = [
  { value: "romantic", label: "Romantic" },
  { value: "friendship", label: "Friendship" },
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "service", label: "Service" },
];

const toneOptions: { value: TonePreference; label: string; helper: string }[] =
  [
    { value: "light", label: "Light", helper: "Cruisey, gentle, low-pressure" },
    {
      value: "balanced",
      label: "Balanced",
      helper: "A mix of playful and direct",
    },
    { value: "serious", label: "Serious", helper: "Direct, to the point" },
  ];

async function saveSelections(formData: FormData) {
  "use server";
  const user = await requireSessionUser();

  const selectedContexts = contextOptions
    .map((ctx) => ctx.value)
    .filter((ctx) => formData.get(`context-${ctx}`) === "on");

  if (selectedContexts.length === 0) {
    return;
  }

  const tone =
    (formData.get("tone") as TonePreference | null) || TonePreference.light;

  await prisma.$transaction(
    selectedContexts.map((contextType) =>
      prisma.contextProfile.upsert({
        where: {
          userId_contextType: {
            userId: user.id,
            contextType,
          },
        },
        update: { tonePreference: tone },
        create: { userId: user.id, contextType, tonePreference: tone },
      }),
    ),
  );

  const destination = selectedContexts[0];
  redirect(`/contexts/${destination}`);
}

export default async function OnboardingPage() {
  const user = await requireSessionUser();
  const existing = await prisma.contextProfile.findMany({
    where: { userId: user.id },
  });

  const existingSet = new Set(existing.map((c) => c.contextType));

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="w-full max-w-3xl space-y-8 rounded-2xl bg-white p-10 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Choose your tracks
          </p>
          <h1 className="text-3xl font-semibold leading-tight">
            Where should we start?
          </h1>
          <p className="text-zinc-600">
            Select the kinds of relationships you want help with. Each one gets
            its own track and tone. No blending.
          </p>
        </div>

        <form action={saveSelections} className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-800">Relationship tracks</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {contextOptions.map((ctx) => (
                <label
                  key={ctx.value}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-400"
                >
                  <input
                    type="checkbox"
                    name={`context-${ctx.value}`}
                    defaultChecked={existingSet.has(ctx.value)}
                    className="mt-1 h-4 w-4 rounded border-zinc-300 text-black focus:ring-0"
                  />
                  <div>
                    <div className="font-medium">{ctx.label}</div>
                    <p className="text-sm text-zinc-600">
                      Kept separate. No cross-mode nudging.
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-800">
              Tone preference
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {toneOptions.map((tone) => (
                <label
                  key={tone.value}
                  className="flex cursor-pointer flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-400"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tone"
                      value={tone.value}
                      defaultChecked={tone.value === TonePreference.light}
                      className="h-4 w-4 border-zinc-300 text-black focus:ring-0"
                    />
                    <div className="font-medium">{tone.label}</div>
                  </div>
                  <p className="text-sm text-zinc-600">{tone.helper}</p>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:bg-zinc-800"
          >
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
