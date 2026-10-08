import { useEffect, useState } from 'react';
import { animationConfig, motionConfig } from '../utils/animationConfig';

export const useOptimizedAnimation = () => {
    const [config, setConfig] = useState(animationConfig.getOptimizedConfig());
    const [motionSettings, setMotionSettings] = useState(motionConfig.normalMotion);

    useEffect(() => {
        const isAndroid = animationConfig.isAndroid();
        const isTablet = animationConfig.isTablet();

        if (isAndroid && isTablet) {
            setMotionSettings(motionConfig.tabletMotion);
        } else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setMotionSettings(motionConfig.reducedMotion);
        } else {
            setMotionSettings(motionConfig.normalMotion);
        }

        setConfig(animationConfig.getOptimizedConfig());
    }, []);

    const getMotionProps = (type = 'x') => {
        return motionSettings[type] || motionSettings.x;
    };

    const applyOptimization = (ref) => {
        if (ref && ref.current) {
            animationConfig.optimizeAnimation(ref.current);
        }
    };

    return {
        config,
        motionSettings,
        getMotionProps,
        applyOptimization,
        isAndroid: animationConfig.isAndroid(),
        isTablet: animationConfig.isTablet(),
    };
};

export default useOptimizedAnimation;