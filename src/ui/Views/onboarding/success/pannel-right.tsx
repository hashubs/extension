import { MdStar, MdVerifiedUser } from 'react-icons/md';
import styles from './pannel-right.module.css';
import { PinnerExtension } from './pinner';

export function PannelRight() {
  return (
    <>
      <div className={styles.shieldContainer}>
        <div className={styles.shieldBox}>
          <div className={styles.shieldRing}>
            <MdVerifiedUser className={styles.shieldIcon} />
          </div>
        </div>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <MdStar key={i} className={styles.starIcon} />
          ))}
        </div>
        <p className={styles.statusText}>"Your assets are now secure"</p>
        <p className={styles.statusLabel}>Protocol Verified</p>
      </div>

      <PinnerExtension />
    </>
  );
}
