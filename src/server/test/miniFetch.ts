export async function miniFetch(
  handler: (req: Request) => Promise<Response>, 
  body: unknown
) {
  const req = new Request("http://localhost/_test", { 
    method: "POST", 
    body: JSON.stringify(body), 
    headers: { "content-type": "application/json" } 
  });
  const res = await (handler as any)(req);
  const json = await res.json();
  return { 
    status: (res as any).status ?? 200, 
    json 
  };
}
