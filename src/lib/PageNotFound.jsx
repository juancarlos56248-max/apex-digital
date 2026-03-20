import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <h1 className="text-7xl font-light text-muted-foreground/30">404</h1>
                    <div className="h-0.5 w-16 bg-gold/20 mx-auto"></div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold">Página No Encontrada</h2>
                    <p className="text-muted-foreground">
                        La página <span className="font-mono text-gold">"{pageName}"</span> no existe.
                    </p>
                </div>
                <div className="pt-4">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-black font-semibold rounded-lg transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        </div>
    );
}