import { SignIn, SignedOut, SignedIn } from '@clerk/chrome-extension';

export const SignInPage = () => {
  return (
    <div className="p-6">
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <h2 className="mb-4 text-2xl font-bold">You're all set!</h2>
          <p className="mb-6 text-lg">You are successfully signed in.</p>
          <p className="text-md text-muted-foreground">
            You can now close this tab and start using the extension.
          </p>
        </div>
      </SignedIn>
    </div>
  );
};
