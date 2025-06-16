module.exports = {
  ci: {
    collect: {
      url: [
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/blog',
      ],
      startServerCommand: 'npm run build && npm run start',
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 