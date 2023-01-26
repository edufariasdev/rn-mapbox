import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, {PROVIDER_GOOGLE, MapUrlTile, UrlTile, Region} from 'react-native-maps';
import { AppConstants } from './constants';
import * as FileSystem from 'expo-file-system'
import { useRef } from "react";

import {Bar} from 'react-native-progress';

const INITIALREGION: Region = {
    latitude: -2.5480906,
    longitude: -44.1272138,
    latitudeDelta: 10,
    longitudeDelta: 15,
  }

export const App = () => {
    const [totalProgress, setTotalProgress] = useState(0);
    const [numZoomLevels, setZoomLevels] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isOffline, setIsOffline] = useState(true)
    const [visisbleSettings, setVisisbleSettings] = useState(true)
    const [mapRegion, setMapRegion] = useState(INITIALREGION)

    const mapRef = useRef<MapView>();

    const urlTemplate = useMemo(
      () =>
        isOffline
          ? `${AppConstants.TILE_FOLDER}/{z}/{x}/{y}.png`
          : `${AppConstants.MAP_URL}?x={x}&y={y}&z={z}.png`,
      [isOffline]
    )

    const currentZoom = useMemo(async () => {
      if(!await mapRef.current?.getCamera()) return 10;
      const currentZoom = (await mapRef.current.getCamera()).zoom;
      const zoom = currentZoom;
      return zoom
    }, [mapRegion])

    useEffect(() => {
      console.log("load tiles")
      fetchTiles()
    }, [currentZoom, mapRegion])



    function calcZoom(longitudeDelta: number) {
    return Math.round(Math.log(360 / longitudeDelta) / Math.LN2)
    }
      
    function tileGridForRegion(region, minZoom, maxZoom) {
        let tiles = []
        
        for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
            const subTiles = tilesForZoom(region, zoom)
            tiles = [...tiles, ...subTiles]
        }
        
        return tiles
    }

    function tilesForZoom(region, zoom) {
        const minLon = region.longitude - region.longitudeDelta
        const minLat = region.latitude - region.latitudeDelta
        const maxLon = region.longitude + region.longitudeDelta
        const maxLat = region.latitude + region.latitudeDelta
      
        let minTileX = lonToTileX(minLon, zoom)
        let maxTileX = lonToTileX(maxLon, zoom)
        let minTileY = latToTileY(maxLat, zoom)
        let maxTileY = latToTileY(minLat, zoom)
      
        let tiles = []
      
        for (let x = minTileX; x <= maxTileX; x++) {
          for (let y = minTileY; y <= maxTileY; y++) {
            tiles.push({ x, y, z: zoom })
          }
        }
      
        return tiles
      }
      
      function degToRad(deg) {
        return deg * Math.PI / 180
      }
      
      function lonToTileX(lon, zoom) {
        return Math.floor((lon + 180) / 360 * Math.pow(2, zoom))
      }
      
      function latToTileY(lat, zoom) {
        return Math.floor(
          (1 - Math.log(Math.tan(degToRad(lat)) + 1 / Math.cos(degToRad(lat))) / Math.PI) /
            2 *
            Math.pow(2, zoom)
        )
      }


      async function fetchTiles() {
    
        const minZoom = await currentZoom - 2;
        const maxZoom = await currentZoom + numZoomLevels
    
        const tiles = tileGridForRegion(mapRegion, minZoom, 21)

        // console.log(tiles.length, maxZoom, minZoom);
        // return;
    
        // Create directory for tiles
        // TODO: Batch to speed up
        for (const tile of tiles) {
          const folder = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}`
          await FileSystem.makeDirectoryAsync(folder, { intermediates: true })
        }
    
        // Download tiles in batches to avoid excessive promises in flight
        const BATCH_SIZE = 200
    
        let batch = []
    
        for (const tile of tiles) {
          //?x={x}&y={y}&z={z}.png
          const fetchUrl = `${AppConstants.MAP_URL}?x=${tile.x}&y=${tile.y}&z=${tile.z}`
          const localLocation = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}/${tile.y}.png`
          const tilePromise = FileSystem.downloadAsync(fetchUrl, localLocation)
          batch.push(tilePromise)
    
          if (batch.length >= BATCH_SIZE) {
            await Promise.all(batch)
            batch = []
          }
        }
    
        await Promise.all(batch)
  
      }
    
return (
    <View style={styles.page}>
        <View style={styles.container}>
            <MapView ref={mapRef} style={styles.map} provider="google" mapType="standard" region={INITIALREGION}  zoomControlEnabled camera={{zoom: 14, center: {latitude: INITIALREGION.latitude, longitude: INITIALREGION.longitude}, altitude: 0, heading: 0, pitch: 0}}>
                {/* <UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"/> */}
                {/* <UrlTile urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"/> */}
                {/* <MapUrlTile urlTemplate="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png"/> */}
                {/* <MapUrlTile urlTemplate="https://khms1.google.com/kh/v=937?x={x}&y={y}&z={z}"/> */}
                <MapUrlTile urlTemplate={urlTemplate} zIndex={1}/>
                {/* <UrlTile urlTemplate="https://khms1.google.com/kh/v=937?x={x}&y={y}&z={z}.png"/> */}
            </MapView>
        </View>
        <View style={{ width: '100%', height: 200, alignItems: 'center' }}>
            <Bar progress={totalProgress} width={300} height={10} style={{marginTop: 50}}/>
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