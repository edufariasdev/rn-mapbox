import React, { FC, useState, useMemo } from 'react'
import { StyleSheet, Text, Slider, ActivityIndicator, View } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { tileGridForRegion } from './utils/TileGrid';
import { AppConstants } from './constants';
import { Region } from 'react-native-maps'

type Props = {
  mapRegion: Region
  onFinish: () => void
}

export const DownloadSettings = ({ mapRegion, onFinish }) => {
  const [numZoomLevels, setZoomLevels] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const currentZoom = useMemo(() => {
    const zoom = calcZoom(mapRegion.longitudeDelta)
    return zoom
  }, [mapRegion])

  async function fetchTiles() {
    setIsLoading(true)

    const minZoom = currentZoom
    const maxZoom = currentZoom + numZoomLevels

    const tiles = tileGridForRegion(mapRegion, minZoom, maxZoom)

    // Create directory for tiles
    // TODO: Batch to speed up
    for (const tile of tiles) {
      const folder = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}`
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true })
    }

    // Download tiles in batches to avoid excessive promises in flight
    const BATCH_SIZE = 100

    let batch = []

    for (const tile of tiles) {
      const fetchUrl = `${AppConstants.MAP_URL}/${tile.z}/${tile.x}/${tile.y}.png`
      const localLocation = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}/${tile.y}.png`
      const tilePromise = FileSystem.downloadAsync(fetchUrl, localLocation)
      batch.push(tilePromise)

      if (batch.length >= BATCH_SIZE) {
        await Promise.all(batch)
        batch = []
      }
    }

    await Promise.all(batch)

    alert('Finished downloading tiles, you are now viewing the offline map.')
  }

  return
    {

    }
}

function calcZoom(longitudeDelta: number) {
  return Math.round(Math.log(360 / longitudeDelta) / Math.LN2)
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  warningMessage: {
    marginVertical: 10,
    color: '#bbb',
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
  },
  estimate: {
    marginVertical: 15,
    textAlign: 'center',
  },
})
