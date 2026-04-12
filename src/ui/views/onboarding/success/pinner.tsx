import { EXTENSION } from '@/app/constants';
import { animated, useSpring } from '@react-spring/web';
import JigsawIcon from 'jsx:../../../assets/jigsaw.svg';
import PinIcon from 'jsx:../../../assets/pin.svg';
import styles from './pinner.module.css';

export function PinnerExtension() {
  const pinnerStyle = useSpring({
    config: { mass: 1, tension: 150, friction: 8 },
    delay: 1000,
    from: { opacity: 0, x: 30 },
    to: { opacity: 1, x: 0 },
  });

  return (
    <animated.div className={styles.pinner} style={pinnerStyle}>
      <div className={styles.pinnerInner}>
        <h3 className={styles.pinnerTitle}>Pin {EXTENSION.name} extension</h3>
        <div className={styles.pinnerRow}>
          Click
          <JigsawIcon
            style={{
              display: 'inline',
              height: 17,
              width: 17,
              margin: '0 8px',
            }}
          />
          in your browser
        </div>
        <div className={styles.pinnerRow}>
          and click the
          <PinIcon
            style={{
              display: 'inline',
              height: 17,
              width: 12,
              margin: '0 8px',
            }}
          />
          button
        </div>
      </div>
    </animated.div>
  );
}
