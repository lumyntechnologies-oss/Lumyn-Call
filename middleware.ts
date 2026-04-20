import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/contacts(.*)',
  '/api/calls(.*)',
  '/api/user(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|svg|gif|ico|webp|webmanifest)(?:\\?.*)?$|api(?!/)).*)',
    '/(api|trpc)(.*)',
  ],
}
