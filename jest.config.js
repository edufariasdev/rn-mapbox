module.exports = {
    preset: "jest-expo",
    testPathIgnorePatterns: [
        "/node_modules/(?!(...|@rnmapbox))",
        '/node_modules',
        '/android',
        '/ios'
    ],
    setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "jest-styled-components", 
        "@rnmapbox/maps/setup-jest"
    ]
}