import { resolve } from 'pathe';
import { VueLoaderPlugin } from 'vue-loader';
import * as webpack from 'webpack';
import KintonePlugin from '@kintone/webpack-plugin-kintone-plugin';

export const defineWebpackConfig = (cwd: string, kintonePlugin: KintonePlugin) => {
  const entry: webpack.Entry = {
    desktop: resolve(cwd, 'src/main/desktop/main.ts'),
    config: resolve(cwd, 'src/main/config/main.ts'),
    mobile: resolve(cwd, 'src/main/desktop/main.ts'),
  };

  const rules: webpack.RuleSetRule[] = [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
        transpileOnly: true,
      },
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
    },
    {
      test: /\.(css|scss)$/,
      use: [
        {
          loader: 'vue-style-loader',
        },
        {
          loader: 'css-loader',
        },
        {
          loader: 'sass-loader',
        },
      ],
    },
  ];

  const config: webpack.Configuration = {
    entry,
    output: {
      path: resolve(cwd, 'plugin', 'js'),
      filename: '[name].js',
    },
    resolve: {
      alias: {
        '@': resolve(cwd, 'src'),
      },
      extensions: ['', '.js', '.ts'],
    },
    module: {
      rules,
    },
    plugins: [new VueLoaderPlugin(), kintonePlugin],
  };

  return config;
}