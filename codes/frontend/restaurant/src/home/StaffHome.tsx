import { LogoutButton } from '../authentication/LogoutButton';

export default function Home() {
    return (
            <div>
                <h1>Home</h1>
                <div style={{ marginTop: '20px' }}>
                    <LogoutButton />
                </div>
            </div>
        );
}