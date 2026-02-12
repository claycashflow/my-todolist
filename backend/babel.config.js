export default {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: '22'
      }
    }],
    ['@babel/preset-typescript', {
      allowDeclareFields: true
    }]
  ],
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        root: ['./src'],
        alias: {
          '@domain': './src/domain',
          '@application': './src/application',
          '@infrastructure': './src/infrastructure',
          '@presentation': './src/presentation'
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    ]
  ]
};
