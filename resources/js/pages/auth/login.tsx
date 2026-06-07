import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot your password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-muted"></div>
                            <span className="mx-4 flex-shrink text-xs font-semibold text-muted-foreground uppercase">
                                Or continue with
                            </span>
                            <div className="flex-grow border-t border-muted"></div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                className="animate-fade-in flex w-full items-center justify-center gap-2"
                                asChild
                            >
                                <a
                                    href="/auth/google/redirect"
                                    title="Log in with Google"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.04 3.1v2.58h3.3c1.93-1.78 3.04-4.4 3.04-7.4 0-.37-.12-.74-.33-1.04z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 20.58c2.43 0 4.47-.8 5.96-2.2l-3.3-2.58c-.9.6-2.07.98-3.3.98-2.34 0-4.33-1.58-5.04-3.7H2.88v2.66c1.5 2.98 5.03 4.84 9.12 4.84z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M6.96 13.08a5.21 5.21 0 0 1 0-3.3V7.12H2.88a10.82 10.82 0 0 0 0 8.62l4.08-2.66z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 6.12c1.32 0 2.5.45 3.44 1.35l2.58-2.58C16.47 3.48 14.43 2.82 12 2.82c-4.09 0-7.62 1.86-9.12 4.3l4.08 2.66c1.5-2.44 3.49-4.02 5.84-4.02z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                className="animate-fade-in flex w-full items-center justify-center gap-2"
                                asChild
                            >
                                <a
                                    href="/auth/facebook/redirect"
                                    title="Log in with Facebook"
                                >
                                    <svg
                                        className="h-4 w-4 fill-current text-[#1877F2]"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                className="animate-fade-in flex w-full items-center justify-center gap-2"
                                asChild
                            >
                                <a
                                    href="/auth/twitter/redirect"
                                    title="Log in with X"
                                >
                                    <svg
                                        className="h-4 w-4 fill-current text-foreground"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                Sign up
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
