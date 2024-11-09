import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [ '**/test/**/*.spec.[jt]s' ],
        environment: 'jsdom',
        clearMocks: true,
        mockReset: true,
        restoreMocks: true,
        reporters: 'basic',
        cacheDir: 'node_modules/.cache/.vitest',
        coverage: {
            enabled: true,
            include: [
                'src/component/dialog.ts',
                'src/component/header.ts',
                'src/component/body.ts',
                'src/component/footer.ts',
                'src/component/container.ts',
                'src/component/command.ts'
            ]
        }
    }
});
