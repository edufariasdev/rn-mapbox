import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapboxGL from "@rnmapbox/maps";

MapboxGL.setAccessToken('pk.eyJ1IjoiZWR1YXJkb2JvdiIsImEiOiJjbDAyczRxc3QxM3oyM2lvMHgzeHc0a25hIn0.Ll5iyZMSLXV3bxuUAW2kpA');



export const App = () => {

    useEffect(() => {
        MapboxGL.setTelemetryEnabled(false);
    }, [])
    
    return (
        <View style={styles.page}>
            <View style={styles.container}>
                <MapboxGL.MapView style={styles.map}  projection="globe" styleURL={MapboxGL.StyleURL.Satellite}>
                </MapboxGL.MapView>
            </View>
        </View>
        )
}

const styles = StyleSheet.create({
page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
container: {
    height: '100%',
    width: '100%',
},
map: {
    flex: 1
}
});