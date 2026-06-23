import Link from "next/link";
import styles from "./NewNavbar.module.scss";

export default function NewNavbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__left}>
        <Link href="/" className={styles.navbar__wordMark}>
          Paletto
        </Link>
        <div className={styles.navbar__spaceBarWrapper}>
          Press
          <div className={styles.spaceBar}>spacebar</div>
          to generate
        </div>
      </div>
    </nav>
  );
}
