// newmoon.js — refonte stable (terminateur correct + rotation du path)

import SunCalc from 'suncalc';

class LunarWidget {
    constructor() {
        this.updateInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.isVisible = true;
        this.isOnline = navigator.onLine;
        
        this.init();
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    init() {
        this.elements = {
            status: document.getElementById('status'),
            phaseName: document.getElementById('phaseName'),
            illumination: document.getElementById('illumination'),
            moonAge: document.getElementById('moonAge'),
            nextFull: document.getElementById('nextFull'),
            lastUpdate: document.getElementById('lastUpdate'),
            refreshBtn: document.getElementById('refreshBtn'),
            moonPhase: document.getElementById('moonPhase'),
            widget: document.querySelector('.lunar-widget')
        };

        // Première mise à jour
        this.updateMoonData();
    }

    setupEventListeners() {
        // Bouton de rafraîchissement
        this.elements.refreshBtn.addEventListener('click', () => {
            this.forceUpdate();
        });

        // Détection de la visibilité de la page
        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (this.isVisible) {
                this.updateMoonData();
            }
        });

        // Détection de la connexion réseau
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateStatus('online');
            this.updateMoonData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatus('offline');
        });

        // Nettoyage avant fermeture
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    updateStatus(status) {
        const statusEl = this.elements.status;
        statusEl.className = 'status-indicator';
        
        switch(status) {
            case 'loading':
                statusEl.classList.add('loading');
                this.elements.widget.classList.add('loading');
                break;
            case 'error':
                statusEl.classList.add('error');
                this.elements.widget.classList.remove('loading');
                break;
            case 'offline':
                statusEl.classList.add('error');
                this.elements.widget.classList.remove('loading');
                break;
            case 'online':
            default:
                this.elements.widget.classList.remove('loading');
                break;
        }
    }

    async updateMoonData() {
        if (!this.isVisible || !this.isOnline) {
            return;
        }

        try {
            this.updateStatus('loading');
            this.elements.refreshBtn.disabled = true;

            const now = new Date();
            const moonData = this.calculateMoonPhase(now);
            
            // Simulation d'un petit délai pour l'effet visuel
            await new Promise(resolve => setTimeout(resolve, 300));
            
            this.displayMoonData(moonData);
            this.updateMoonVisualization(moonData);
            
            this.elements.lastUpdate.textContent = now.toLocaleString('fr-FR');
            this.updateStatus('online');
            this.retryCount = 0;

        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            this.handleError(error);
        } finally {
            this.elements.refreshBtn.disabled = false;
        }
    }

    calculateMoonPhase(date) {
        try {
            const moonIllumination = SunCalc.getMoonIllumination(date);
            
            const illumination = Math.round(moonIllumination.fraction * 100);
            const phase = moonIllumination.phase;
            const angle = moonIllumination.angle;
            const age = Math.round(phase * 29.53); // Cycle lunaire moyen
            
            // Calcul de la prochaine pleine lune
            const nextFullMoon = this.getNextFullMoon(date);
            
            return {
                illumination,
                phase,
                angle,
                age,
                phaseName: this.getPhaseName(phase),
                nextFullMoon,
                fraction: moonIllumination.fraction
            };
        } catch (error) {
            throw new Error(`Erreur de calcul lunaire: ${error.message}`);
        }
    }

    getPhaseName(phase) {
        if (phase < 0.03 || phase > 0.97) return 'Nouvelle Lune';
        if (phase < 0.22) return 'Premier Croissant';
        if (phase < 0.28) return 'Premier Quartier';
        if (phase < 0.47) return 'Lune Gibbeuse Croissante';
        if (phase < 0.53) return 'Pleine Lune';
        if (phase < 0.72) return 'Lune Gibbeuse Décroissante';
        if (phase < 0.78) return 'Dernier Quartier';
        return 'Dernier Croissant';
    }

    getNextFullMoon(fromDate) {
        let date = new Date(fromDate);
        let daysChecked = 0;
        const maxDays = 35;
        
        while (daysChecked < maxDays) {
            date.setDate(date.getDate() + 1);
            const moonData = SunCalc.getMoonIllumination(date);
            
            if (moonData.phase >= 0.48 && moonData.phase <= 0.52) {
                const diffTime = date.getTime() - fromDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
            }
            daysChecked++;
        }
        
        return 'Calcul impossible';
    }

    displayMoonData(data) {
        this.elements.phaseName.textContent = data.phaseName;
        this.elements.illumination.textContent = `${data.illumination}%`;
        this.elements.moonAge.textContent = `${data.age} jour${data.age > 1 ? 's' : ''}`;
        this.elements.nextFull.textContent = data.nextFullMoon;
    }

    updateMoonVisualization(moonData) {
        const moonPhaseEl = this.elements.moonPhase;
        const { fraction, phase, angle } = moonData;
        
        // Constantes pour le calcul
        const cx = 100;
        const cy = 100;
        const r = 80;
        
        // Clamp pour éviter les valeurs extrêmes
        const f = Math.min(0.999, Math.max(0.001, fraction));
        
        // Calcul de la largeur de l'ellipse d'ombre
        const k = 2 * f - 1; // Normalisation entre -1 et 1
        const ellipseWidth = Math.abs(k) * r;
        
        // Déterminer si la lune est croissante ou décroissante
        const isWaxing = angle < 0;
        
        let pathData = '';
        
        if (f < 0.01) {
            // Nouvelle lune - cercle complet d'ombre
            pathData = `M ${cx - r} ${cy} 
                       A ${r} ${r} 0 1 1 ${cx + r} ${cy}
                       A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
        } else if (f > 0.99) {
            // Pleine lune - pas d'ombre
            pathData = '';
        } else {
            // Phases partielles
            if (isWaxing) {
                // Lune croissante - ombre à gauche
                if (f < 0.5) {
                    // Premier croissant
                    pathData = `M ${cx} ${cy - r}
                               A ${r} ${r} 0 0 0 ${cx} ${cy + r}
                               A ${ellipseWidth} ${r} 0 0 1 ${cx} ${cy - r} Z`;
                } else {
                    // Gibbeuse croissante
                    pathData = `M ${cx} ${cy - r}
                               A ${r} ${r} 0 0 0 ${cx} ${cy + r}
                               A ${ellipseWidth} ${r} 0 0 0 ${cx} ${cy - r} Z`;
                }
            } else {
                // Lune décroissante - ombre à droite
                if (f > 0.5) {
                    // Gibbeuse décroissante
                    pathData = `M ${cx} ${cy - r}
                               A ${r} ${r} 0 0 1 ${cx} ${cy + r}
                               A ${ellipseWidth} ${r} 0 0 0 ${cx} ${cy - r} Z`;
                } else {
                    // Dernier croissant
                    pathData = `M ${cx} ${cy - r}
                               A ${r} ${r} 0 0 1 ${cx} ${cy + r}
                               A ${ellipseWidth} ${r} 0 0 1 ${cx} ${cy - r} Z`;
                }
            }
        }
        
        moonPhaseEl.setAttribute('d', pathData);
        
        // Rotation pour l'orientation correcte
        const rotationAngle = angle * 180 / Math.PI;
        moonPhaseEl.setAttribute('transform', `rotate(${rotationAngle}, ${cx}, ${cy})`);
        
        // Debug
        console.log(`Phase: ${phase.toFixed(3)}, Illumination: ${(fraction*100).toFixed(1)}%, Angle: ${rotationAngle.toFixed(1)}°, Croissante: ${isWaxing}`);
    }

    handleError(error) {
        this.retryCount++;
        this.updateStatus('error');
        
        if (this.retryCount < this.maxRetries) {
            console.log(`Tentative ${this.retryCount}/${this.maxRetries} dans 5 secondes...`);
            setTimeout(() => {
                this.updateMoonData();
            }, 5000);
        } else {
            console.error('Nombre maximum de tentatives atteint');
            this.elements.phaseName.textContent = 'Erreur de connexion';
            this.elements.illumination.textContent = '--';
            this.elements.moonAge.textContent = '--';
            this.elements.nextFull.textContent = '--';
        }
    }

    startAutoUpdate() {
        // Mise à jour toutes les heures
        this.updateInterval = setInterval(() => {
            if (this.isVisible && this.isOnline) {
                this.updateMoonData();
            }
        }, 60 * 60 * 1000); // 1 heure
    }

    forceUpdate() {
        this.retryCount = 0;
        this.updateMoonData();
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialisation du widget
const lunarWidget = new LunarWidget();

// Export pour utilisation externe
window.lunarWidget = lunarWidget;
