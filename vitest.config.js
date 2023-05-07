import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [ '**/test/**/*.spec.[jt]s' ],
        environment: 'jsdom',
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        reporters: 'basic',
        cache: { dir: 'node_modules/.cache/.vitest' },
        coverage: {
            enabled: true,
            include: [
                'src/dialog.ts',
                'src/header.ts',
                'src/body.ts',
                'src/footer.ts',
                'src/container.ts'
            ]
        }
    }
});
