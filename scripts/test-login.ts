async function main() {
  // Step 1: Get CSRF token + cookie
  const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
  const csrfCookie = csrfRes.headers.get("set-cookie") || "";
  const { csrfToken } = await csrfRes.json();
  console.log("CSRF token:", csrfToken);
  console.log("Cookie:", csrfCookie.substring(0, 60) + "...");

  // Step 2: POST credentials
  const res = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookie.split(";")[0],
    },
    body: new URLSearchParams({
      email: "admin@pulse.ru",
      password: "demo123",
      csrfToken,
    }),
    redirect: "manual",
  });

  console.log("Status:", res.status);
  console.log("Location:", res.headers.get("location"));
  const setCookies = res.headers.getSetCookie?.() || [];
  console.log("Set-Cookie count:", setCookies.length);
  for (const c of setCookies) {
    console.log("  ", c.substring(0, 80) + "...");
  }
}
main();
