import build from './build'

export default Object.assign(build, {
    input: 'build/imports.js',
    output: Object.assign(build.output, {
        file: 'dist/circle.js',
        format: 'umd'
    })
})