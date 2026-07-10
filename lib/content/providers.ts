export type GenerateInput = { system: string; prompt: unknown; model?: string };
export interface AiProvider { name: string; generateJson<T>(input: GenerateInput): Promise<T>; }
export function getAiProvider(): AiProvider { return new OpenAIResponsesProvider(process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'); }
class OpenAIResponsesProvider implements AiProvider {
  name = 'openai-responses';
  constructor(private defaultModel: string) {}
  async generateJson<T>({ system, prompt, model }: GenerateInput): Promise<T> {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required for OpenAI draft generation.');
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: model ?? this.defaultModel, input: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(prompt) }], text: { format: { type: 'json_object' } } }) });
    if (!response.ok) throw new Error(`OpenAI Responses API failed: ${response.status} ${await response.text()}`);
    const data = await response.json() as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const text = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).map((item) => item.text).filter(Boolean).join('\n');
    if (!text) throw new Error('OpenAI response did not include JSON text.');
    return JSON.parse(text) as T;
  }
}
