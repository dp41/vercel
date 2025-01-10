'use client'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import {auth} from "@/lib/firebase";
import {  signInWithEmailAndPassword   } from 'firebase/auth';

export function LoginForm() {

    const {toast} = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            console.log("Connecting to Firebase...");
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    document.cookie = "isLoggedIn=true; path=/; max-age=43200";
                    router.push('/dashboard');
                }) .catch((error) => {
                alert(error.message);
            });
        } catch (error) {
            console.error('Error logging in:', error);
            setError('An error occurred while logging in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Card className="p-3">
                <CardHeader>
                    <CardTitle className="text-2xl text-title">Login</CardTitle>
                    <CardDescription className="text-subtitle">
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label className="text-title" htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label className="text-title" htmlFor="password">Password</Label>
                                </div>
                                <Input placeholder="password" id="password" type="password" value={password}
                                       onChange={(e) => setPassword(e.target.value)} required/>
                            </div>

                            <Button type="submit" className="w-full rounded">
                                Login
                            </Button>

                            {isLoading && (
                                <Loader message='Logging...'/>
                            )}

                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <a href="/signup" className="underline underline-offset-4">
                                Sign up
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
