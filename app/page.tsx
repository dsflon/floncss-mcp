import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>FlonCSS MCP Server</h1>
        <p className={styles.description}>
          This is the FlonCSS MCP Server deployed on Vercel.
        </p>
        <div className={styles.info}>
          <p>
            API Endpoint: <code className={styles.code}>/api/mcp</code>
          </p>
          <p>
            This server provides access to FlonCSS documentation and tools via the Model Context Protocol.
          </p>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>
          Powered by <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</a> and <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a>
        </p>
      </footer>
    </div>
  );
}
