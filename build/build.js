import banner from './banner'
import babel from '@rollup/plugin-babel'

export default {
    output: {
        name: 'Circle',
        banner
    },
    plugins: [
        babel({
            babelHelpers: 'bundled'
        })
    ]
}