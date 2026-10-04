import { useState } from 'react'
import { buildImageUrl } from '../utils.js'

const SIZES = [
  { value: 'portrait_4_3', label: '竖图 3:4' },
  { value: 'square', label: '方图 1:1' },
  { value: 'landscape_4_3', label: '横图 4:3' },
  { value: 'landscape_16_9', label: '横图 16:9' },
]

export default function ImageField({ images, onChange, label = '配图' }) {
  const [url, setUrl] = useState('')
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('portrait_4_3')

  const addUrl = () => {
    const value = url.trim()
    if (!value) return
    onChange([...images, value])
    setUrl('')
  }

  const generate = () => {
    const value = prompt.trim()
    if (!value) return
    onChange([...images, buildImageUrl(value, size)])
    setPrompt('')
  }

  const remove = (index) => onChange(images.filter((_, i) => i !== index))

  return (
    <div className="field">
      <label>{label}</label>

      <div className="upload-row">
        <input
          className="input"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="粘贴图片地址，回车添加"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addUrl()
            }
          }}
        />
        <button type="button" className="btn btn-ghost" onClick={addUrl}>
          添加
        </button>
      </div>

      <div className="gen-box">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          ✨ 没有图？用一句话生成配图
        </div>
        <div className="gen-row">
          <input
            className="input"
            style={{ flex: 1, minWidth: 220 }}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="例如：一只橘猫在窗台晒太阳，温暖午后光线"
          />
          <select className="select" style={{ width: 130 }} value={size} onChange={(event) => setSize(event.target.value)}>
            {SIZES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-primary" onClick={generate}>
            生成配图
          </button>
        </div>
        <div className="form-hint">生成的图片会作为图片地址直接保存到数据库，无需上传文件。</div>
      </div>

      {images.length > 0 && (
        <div className="img-preview-grid">
          {images.map((item, index) => (
            <div className="img-preview" key={`${item}-${index}`}>
              <img src={item} alt={`配图 ${index + 1}`} />
              <button type="button" className="img-remove" onClick={() => remove(index)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
