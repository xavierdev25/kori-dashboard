/**
 * Los iconos del panel, en un solo sitio.
 *
 * Vienen de reicon-react. Se importan uno a uno desde `reicon-react/icons/*`
 * y no desde la raiz del paquete: la raiz reexporta los 2.674 iconos y basta
 * un fallo de tree-shaking para que acaben todos en el bundle.
 *
 * Los nombres que se exportan aqui son los que ya usaba el codigo, asi que
 * migrar fue cambiar el import y nada mas. Donde reicon no traia un icono con
 * ese nombre, se eligio el equivalente mas cercano y se anota por que.
 */

export { default as AlertTriangle } from "reicon-react/icons/AlertTriangle";
export { default as ArrowLeft } from "reicon-react/icons/ArrowLeft";
export { default as ArrowRight } from "reicon-react/icons/ArrowRight";
export { default as Check } from "reicon-react/icons/Check";
export { default as ChevronLeft } from "reicon-react/icons/ChevronLeft";
export { default as ChevronRight } from "reicon-react/icons/ChevronRight";
export { default as Clock } from "reicon-react/icons/Clock";
export { default as Download } from "reicon-react/icons/Download";
export { default as Eye } from "reicon-react/icons/Eye";
export { default as EyeOff } from "reicon-react/icons/EyeOff";
export { default as FileText } from "reicon-react/icons/FileText";
export { default as Images } from "reicon-react/icons/Images";
export { default as LogIn } from "reicon-react/icons/Login";
export { default as Package } from "reicon-react/icons/Package";
export { default as Plus } from "reicon-react/icons/Plus";
export { default as Receipt } from "reicon-react/icons/Receipt";
export { default as Save } from "reicon-react/icons/Save";
export { default as Search } from "reicon-react/icons/Search";
export { default as ShoppingBag } from "reicon-react/icons/ShoppingBag";
export { default as Star } from "reicon-react/icons/Star";
export { default as StickyNote } from "reicon-react/icons/Stickynote";
export { default as Trash2 } from "reicon-react/icons/Trash2";
export { default as Settings } from "reicon-react/icons/Settings";
export { default as Upload } from "reicon-react/icons/Upload";

// Sin nombre identico en reicon: se toma el equivalente mas cercano.
/** El glifo estandar de "abre fuera": flecha que sale de un marco. */
export { default as ExternalLink } from "reicon-react/icons/ArrowUpRightSquare";
/** Hueco de imagen que falta. Reicon no trae un "imagen tachada". */
export { default as ImageOff } from "reicon-react/icons/ImageMinus";
/** El spinner. Reicon no numera los pesos, solo hay `Loader`. */
export { default as Loader2 } from "reicon-react/icons/Loader";
export { default as RefreshCcw } from "reicon-react/icons/Refresh";
/** Deshacer un filtro: flecha circular. */
export { default as RotateCcw } from "reicon-react/icons/ArrowRotate";
/** Barras con la flecha de tendencia: dice "ingresos" mejor que una linea. */
export { default as TrendingUp } from "reicon-react/icons/ChartBarTrendUp";
export { default as Undo2 } from "reicon-react/icons/Undo";

// Navegacion.
export { default as BarChart3 } from "reicon-react/icons/ChartBar";
export { default as LogOut } from "reicon-react/icons/Logout";
export { default as Mail } from "reicon-react/icons/Envelope";
/** La camiseta: reicon la llama Tshirt. */
export { default as Shirt } from "reicon-react/icons/Tshirt";
export { default as X } from "reicon-react/icons/Xmark";

export type { IconProps } from "reicon-react";
