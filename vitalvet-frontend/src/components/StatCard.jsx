export default function StatCard({ icon, number, label, color = 'var(--primary)' }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconBox, background: color + '18', color }}>
        {icon}
      </div>
      <div style={styles.number}>{number}</div>
      <div style={styles.label}>{label}</div>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid var(--border)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: 'var(--shadow)',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginBottom: 2,
  },
  number: {
    fontSize: 26,
    fontWeight: 700,
    color: 'var(--text-main)',
    lineHeight: 1,
  },
  label: {
    fontSize: 12,
    color: 'var(--text-sub)',
  },
}
